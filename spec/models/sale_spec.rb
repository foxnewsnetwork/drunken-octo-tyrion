require 'spec_helper'

describe Sale do 
	describe "Sanity" do 
		it "should be there" do 
			Sale.should_not be_nil
		end # it
	end # sanity
	describe 'genreate order' do 
		before :each do 
			@plant = FactoryGirl.create :plant
			@material = @plant.materials.create FactoryGirl.attributes_for(:material)
  			@company = FactoryGirl.create :company
			@sale = { :materials => [], :company => @company.name }
			@sale[:materials] << {
				:name => @material.name ,
				:quantity => 100 ,
				:units => "pounds" ,
				:price => 10
			} # sale
			@generator = Sale.new @plant, @sale 
		end # each

		it "should generate" do 			
			@generator.generate_order.should_not be_nil
		end # it
		it "should create" do 
			expect { @generator.generate_order }.to change(Order, :count).by 1
		end # it
	end # it
end # Sale