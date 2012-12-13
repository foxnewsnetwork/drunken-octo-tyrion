require 'spec_helper'

describe UsersController do
  before :each do 
    @user = FactoryGirl.create :user, :email => "assfag@ass.fag"
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

  describe "PUT 'level'" do 
    login_user :management
    before :each do 
      @level = lambda do 
        put :level, :id => @user.id, :level => 7
      end # level
    end # each
    it "should change level" do 
      @level.call
      User.find(@user.id).level.should eq 7
    end # it
  end # put

end
