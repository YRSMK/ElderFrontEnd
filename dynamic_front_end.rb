require 'rack-flash'
require 'dropbox_sdk'

class DynamicFrontEnd < Sinatra::Base

  set :public_folder => "public", :static => true
  enable :sessions
  use Rack::Flash
  set :session_secret, "e9a37a7612ad2b501c648ccba28b4a539e31c9a732452b677b2b7d39d9daa39da18b06da24b9efdfd5ea312789ded1fd776bc722f842f66a02d3357c246c56de"
  $redis = Redis.new(:url => ENV["REDISCLOUD_URL"])
  ##########################################
  # Methods                                #
  ##########################################

  def auth!
    unless session[:username]
      flash[:message] = "You are not logged in"
      redirect '/login/signin'
    end
  end

  def get_dropbox_auth
    redirect_uri = "#{request.base_url}/api/auth/dropbox/callback"
    flow = DropboxOAuth2Flow.new( 'glykt2ktunllls8', 'khfxhnkamr8jc96', redirect_uri, session, :dropbox_auth_csrf_token)
  end

  def get_dropbox_client
    return DropboxClient.new(session[:dropbox_access_token]) if session[:dropbox_access_token]
  end

  ##########################################
  # General Routes                         #
  ##########################################

  get '/api/getfiles/dropbox' do
    session['dropbox_access_token'] ||= ''
    if session['dropbox_access_token'] != ''
      content_type :json
      if !$redis.get("media")
        search = get_dropbox_client.metadata('/')["contents"]
        media = []
        search.each do |item|
          if !item["mime_type"].nil?
            if item["mime_type"].include?("image")
              media.push(get_dropbox_client.media(item["path"]))
            end
          end
        end
        json = Oj.dump(media)
        $redis.set("media", json)
        $redis.expire("media", 300)
        json
      else
        Oj.dump(Oj.load($redis.get("media")))
      end
    else
      Oj.dump({status: "failed"})
    end
  end

  get "/" do
    if session[:username]
      users = DB[:users]
      @temp = DB[:temp_sensors].order(:date).first
      @user = users.where(username: session[:username]).first
    end
    @title = "Elder Net"
    erb :index
  end

  get "/wordsearch" do
    @title = "Elder Net"
    erb :wordsearch
  end

  get "/login/signin" do
    if session['username'].nil?
      @title = "Elder Net"
      erb :signin
    else
      redirect '/'
    end
  end

  post "/login/signin" do
    if session['username'].nil?
      @title = "Elder Net"
      if !params[:username].empty? & !params[:password].empty?
        users = DB[:users]
        user = users.where(username: params[:username])
        if !user.empty?
          if user.first[:password] == BCrypt::Engine.hash_secret(params[:password], user.first[:salt])
            session['username'] = params[:username]
            redirect "/"
          else
            flash[:message] = "Wrong password!"
            erb :signin
            # content_type :json
            # Oj.dump([user.first[:password], BCrypt::Engine.hash_secret(params[:password], user.first[:salt])])
          end
        else
          flash[:message] = "No user with that name!"
          erb :signin
        end
      else
        flash[:message] = "Some fields are missing"
        erb :signin
      end
    else
      redirect '/'
    end
  end

  get "/login/signup" do
    @title = "Elder Net"
    erb :signup
  end

  post "/login/signup" do
    @title = "Elder Net"
    if params[:password] == params[:re_password]
      check = DB[%Q(SELECT * FROM users WHERE username = '#{params[:username]}' or phone = '#{params[:phone]};')].all
      if !check.empty?
        flash[:message] = 'This username or phone number is already taken!'
        erb :signup
      else
        users = DB[:users]
        password_salt = BCrypt::Engine.generate_salt
        password_hash = BCrypt::Engine.hash_secret(params[:password], password_salt)
        users.insert(username: params[:username], password: password_hash, phone: params[:phone], salt: password_salt, picture: params[:picture])
        session['username'] = params[:username]
        redirect '/'
      end
    else
      flash[:message] = "Passwords don't match!"
      erb :signup
    end
  end

  get "/logout" do
    session['username'] = nil
    session.delete(:dropbox_access_token)
    redirect "/"
  end

  get "/news" do
    auth!
    @title = "Elder Net"
    get_tags = DB[%Q(select tag.tag from tag, t_connections, users where users.id = t_connections.uid_ and tag.id = t_connections.tid and t_connections.orig = 0 and users.username = "#{session[:username]}";)].all
    @articles = []
    get_tags.each do |tag|
      article = DB[%Q(select articles.name, articles.url, articles.simplified, articles.date_p from articles, users, tag, t_connections where tag.tag = '#{tag[:tag]}' and tag.id = t_connections.tid and t_connections.orig = 1 and articles.id = t_connections.uid_ order by articles.date_p desc limit 30;)]
      @articles.push(article)
    end
    erb :news
  end

  get "/admin/apps" do
    auth!
    users = DB[:users]
    if users.where(username: session[:username]).first[:admin] == true
      @title = "Elder Net"
      erb :add_apps
    else
      redirect '/'
    end
  end

  post "/admin/apps" do
    auth!
    @title = "Elder Net"
    params[:name] = params[:name] || ''
    params[:url] = params[:url] || ''
    params[:platform] = params[:platform] || ''
    params[:version] = params[:version] || ''
    users = DB[%Q(select admin from users where username= "#{session[:username]}")].first
    if users[:admin] == true
      if !params[:name].empty? & !params[:url].empty? & !params[:platform].empty? & !params[:version].empty?
        apps = DB[:apps]
        apps.insert(name: params[:name], url: params[:url], platform: params[:platform], version: params[:version], pub: params[:pub], desc:  params[:desc], icon: params[:icon])
        flash[:message] = "App Added!"
        erb :add_apps
      else
        flash[:message] = "You missed a field"
        erb :add_apps
      end
    else
      redirect '/'
    end
  end

  post "/apps" do
    content_type :json
    params[:username] = params[:username] || ''
    params[:password] = params[:password] || ''
    params[:apps] = params[:apps] || ''
    params[:platform] = params[:platfo/appsrm] || ''
    if !params[:username].empty? & !params[:password].empty? & !params[:apps].empty? & !params[:platform].empty?
      users = DB[:users]
      user = users.where(username: params[:username])
      if !user.empty?
        if user.first[:password] == BCrypt::Engine.hash_secret(params[:password], user.first[:salt])
          apps = DB[:apps]
          # Oj.dump({success: true, platform: params[:platform], apps: params[:apps]})
          Oj.dump({success: true, apps: Oj.load(URI.unescape(params[:apps])), platform: params[:platform]})
        else
          Oj.dump({success: false, message: "Wrong password!"})
        end
      else
        Oj.dump({success: false, message: "No user with that name!"})
      end
    else
      Oj.dump({success: false, message: "Not Enough Data"})
    end
  end

  ##########################################
  # Oauth Routes                           #
  ##########################################
  get '/api/auth/dropbox' do
    auth_url = get_dropbox_auth.start
    redirect to auth_url
  end

  get '/api/auth/dropbox/logout' do
    session.delete(:dropbox_access_token)
    redirect to '/'
  end

  get '/api/auth/dropbox/callback' do
    code = params[:code]
    dropbox_access_token, user_id, url_state = get_dropbox_auth.finish(params)
    session['dropbox_access_token'] = dropbox_access_token
    redirect to '/'
  end

end
