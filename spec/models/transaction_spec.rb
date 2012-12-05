require 'spec_helper'

describe Transaction do 
	describe "sanity test" do 
		it "should be there" do 
			Transaction.should_not be_nil
		end # it
	end # sanity
	context "plant sells some to company" do 
		standard_setup :price
		before :each do 
			@stuff = {
				:name => @material.name ,
				:quantity => @quantity ,
				:units => @units ,
				:price => @price
			} # stuff
			@dogfood = @plant.materials.create FactoryGirl.attributes_for(:material).replace(:name => "dogfood")
			@more_stuff = {
				:name => @dogfood.name ,
				:quantity => 10 ,
				:units => "pounds" ,
				:price => 10
			} 
		end # each
		it "should not have order defined here" do 
			@order.should be_nil
		end # it
		it "should create an order" do 
			lambda do 
				order = @plant.sells.some(@stuff).to(@company)
			end.should change(Order, :count).by 1 # lambda
		end # it
		it "should accrew orders" do 
			lambda do 
				@plant.sells.some(@stuff).some(@more_stuff).to(@company)
			end.should change(Order, :count).by 1
		end # it
	end # context
end # Transaction