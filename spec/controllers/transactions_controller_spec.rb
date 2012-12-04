require 'spec_helper'

describe TransactionsController do
	describe "creation" do 
		before :each do 
			@plant = FactoryGirl.create :plant
			@material = @plant.materials.create FactoryGirl.attributes_for(:material)
			@company = FactoryGirl.create :company
			@order = {
				:materials => [@material.name] ,
				:quantities => [145] ,
				:units => ["pounds"] ,
				:prices => [11] ,
				:company => @company.name
			}.merge FactoryGirl.attributes_for(:order)
			@create = lambda do 
				post :create, :plant_id => @plant, :transaction => @order
			end # create
		end # each
		context "as sales" do 
			login_user :sales
			it "should create the order" do 
				@create.should change(Order, :count).by 1
			end # it
		end # as sales
	end #  creation
end # transactions
