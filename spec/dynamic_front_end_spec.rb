require_relative "spec_helper"
require_relative "../dynamic_front_end.rb"

def app
  DynamicFrontEnd
end

describe DynamicFrontEnd do
  it "responds with a welcome message" do
    get '/'

    last_response.body.must_include 'Welcome to the Sinatra Template!'
  end
end
