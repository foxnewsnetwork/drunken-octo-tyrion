# == Schema Information
#
# Table name: plants
#
#  id            :integer          not null, primary key
#  name          :string(255)
#  country       :string(255)
#  state         :string(255)
#  city          :string(255)
#  address       :string(255)
#  sqft          :integer
#  founding_date :date
#  closing_date  :date
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

require 'spec_helper'

describe Plant do
	describe "sanity test" do 
		it "should allow me to factory out one" do
			plant = FactoryGirl.create :plant
			plant.should_not be_nil
		end # it
	end # sanity
	describe "relationships" do
		before :each do
			@plant = FactoryGirl.create :plant
		end # each
		describe "plant-material" do
			describe "creation" do 
				it "should allow me to create a material" do
					lambda do
						@plant.materials.create FactoryGirl.attributes_for(:material)
					end.should change(Material, :count).by(1)
				end # it
			end # creation
			describe "interconnection" do 
				before :each do
					@material = @plant.materials.create FactoryGirl.attributes_for(:material)
				end # each
				it "should give mthe material" do
					@plant.materials.should include @material
				end # it
			end # interconnection
		end # plant-material
	end # relationshipos
	describe "accountability" do 
		before :each do 
	  		@plant = FactoryGirl.create :plant
	  		2.times do |n|
	  			(@materials ||= []) << @plant.materials.create(FactoryGirl.attributes_for :material, :name => "dogfood#{n}")
	  			(@quantities ||= []) << { :quantity => 10, :units => "tons" }
	  			(@prices ||= []) << 100
	  		end # 2 times
	  		@expected = 2000.0
	  		@company = FactoryGirl.create :company 
	  		@order = @company.buys(*@quantities).of(*@materials).at(*@prices).from(@plant)
	  	end # each
	  	it "should show me the money" do 
	  		@plant.gross_income.to_s.should eq @expected.to_s
	  	end # it
	end # it accountability
end # Plant
