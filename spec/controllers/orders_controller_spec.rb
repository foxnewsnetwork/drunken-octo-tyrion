require 'spec_helper'

describe OrdersController do
	describe "update_material" do 
		standard_setup
		login_user :sale
		before :each do 
			@evil_material = {
				:name => "shit" ,
				:quantity => 12 ,
				:units => "tons" ,
				:unit_price => 10
			}
			@order = @plant.sells(100, "tons").signed_by(@current_user).of(@material).at(140).to(@company)
			@update = lambda do
				post :update_material, :id => @order.id, :material => @evil_material
			end # update
		end # before each
		it "should not be nil" do 
			@order.id.should_not be_nil
		end # it
		it "should have a buyable" do 
			@update.call
			
			controller.order.materials.last.buyable.should eq controller.order
		end # it
		it "should create another material" do 
			@update.should change(Material, :count).by 1
		end # it
		it "should give me what I expect" do 
			@update.call
			controller.order.materials.last.name.should eq "shit"			
		end # it
	end # 	
end # Orders
