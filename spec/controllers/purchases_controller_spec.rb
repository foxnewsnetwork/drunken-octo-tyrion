require 'spec_helper'

describe PurchasesController do
	before :each do 
		@plant = FactoryGirl.create :plant
	end # each
  describe "GET 'index'" do
    it "returns http success" do
      get 'index', :plant_id => @plant
      response.should be_success
    end
  end

end
