require 'spec_helper'

describe UsersController do
  before :each do 
    @user = FactoryGirl.create :user
  end # each

  describe "GET 'show'" do
    it "returns http success" do
      get 'show', :id => @user
      response.should be_success
    end
  end

  describe "GET 'edit'" do
    it "returns http success" do
      get 'edit', :id => @user.id
      response.should be_success
    end
  end

end
