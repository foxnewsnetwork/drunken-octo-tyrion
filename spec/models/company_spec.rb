# == Schema Information
#
# Table name: companies
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'spec_helper'

describe Company do
  describe "sanity test" do 
  	it "shoudl be valid" do 
  		FactoryGirl.create(:company).should_not be_nil
  	end # it
  end # sanity
  describe "accounting" do 
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
  	it "should show me how much money" do 
  		@company.expenses.to_s.should eq @expected.to_s
  	end # it
  end # accounting
end
