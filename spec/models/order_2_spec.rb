require 'spec_helper'

describe Order do
	describe "custom_create" do 
		before :each do 
			@plant = FactoryGirl.create :plant
			@order = @plant.orders.new
			@material = @plant.materials.create FactoryGirl.attributes_for(:material)
			@company = FactoryGirl.create :company
			@params = {
				:materials => [@material.name] ,
				:quantities => [145] ,
				:units => ["pounds"] ,
				:prices => [11] ,
				:company => @company.name
			}.merge FactoryGirl.attributes_for(:order)
		end # each
		it "should allow for create" do 
			expect do 
				@order.custom_create @params
			end.to change(Order, :count).by 1
		end # it
	end # custom
end # Order