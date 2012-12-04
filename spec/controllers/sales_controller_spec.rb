require 'spec_helper'

describe SalesController do
	before :each do 
		@plant = FactoryGirl.create :plant
	end # each
  describe "GET 'index'" do
    login_user :sales
    it "returns http success" do
      get 'index', :plant_id => @plant.id
      response.should be_success
    end
  end
  describe "creation" do 
  	before :each do 
  		@material = @plant.materials.create FactoryGirl.attributes_for(:material)
  		@company = FactoryGirl.create :company
  		@sale = { :materials => [], :company => @company.name }
  		@sale[:materials] << {
  			:name => @material.name ,
  			:quantity => 100 ,
  			:units => "pounds" ,
  			:price => 10
  		} # sale
  		@create = lambda do 
  			post :create, :plant_id => @plant, :sale => @sale
  		end # create
  	end # each
  	context "as sales" do 
  		login_user :sales
  		it "should change the database" do 
  			@create.should change(Order, :count).by 1
  		end # it
  	end # as sales
  end # creation
end # salescontroller
