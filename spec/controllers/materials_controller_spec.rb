require 'spec_helper'

describe MaterialsController do
	standard_setup
	describe "proper logic" do 
		it "should be right class" do 
			@plant.orders.sales.each do |sale|
				sale.class.should eq Order
				sale.genre.should eq 'sale'
			end # sales
		end # it
		it "should be reduce correctly" do 
			@plant.orders.sales.reduce({}) do |mem, sale|
				mem.class.should eq Hash 
				output = sale.materials.reduce(mem) do |cache, material|
					cache.class.should eq Hash
					if cache.has_key? material.name
						cache[material.name] += Mass.new material.quantity, material.units
					else
						cache[material.name] = Mass.new material.quantity, material.units
					end # if-else
					cache.class.should eq Hash
					cache
				end # reduce
				output.class.should eq Hash 
				output
			end # reduce
		end # it
	end # proper logic
	describe "show" do
		login_user :sales 		
		before( :each ){ get "index", :plant_id => @plant }
		it "should show correctly" do 
			response.should be_success
		end # it
		it "should feature a hash of mass units" do 
			controller.sales.each do |key, mass|
				key.class.should eq String
				mass.class.should eq Mass
			end # each key,mass
		end # it
	end # show
	describe 'timed queries' do 
		login_user :sales
		before(:each) { get "index", :plant_id => @plant, :start => 7.days.ago, :end => 1.days.ago }
		it "should be success" do 
			response.should be_success
		end # it
	end # timed
end # Materials controller
