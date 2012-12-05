require 'spec_helper'

describe MaterialsController do
	standard_setup
	describe "show" do
		login_user :sales 		
		it "should show correctly" do 
			get "index", :order_id => @order 
			response.should be_success
		end # it
	end # show
	describe "create" do 
		before :each do 
			@evil_material = {
				:name => @material.name ,
				:quantity => @quantity ,
				:units => @units ,
				:price => @price
			} # evil_material
			@create = lambda do 
				post :create, :order_id => @order, :material => @evil_material
			end # create
			
		end # before each
	end # create
end # Materials controller
