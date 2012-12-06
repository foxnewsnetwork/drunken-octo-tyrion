require 'spec_helper'

describe Sale do 
	describe "Sanity" do 
		it "should be there" do 
			Sale.should_not be_nil
		end # it
	end # sanity
	describe "creation" do 
		standard_setup :price
		before :each do 
			@user = FactoryGirl.create :user, :level => 4
			@sale = Sale.new( @plant).signed_by @user
		end # each
		it "should be there" do 
			@sale.should_not be_nil
		end # it
		it "should get the right key" do 
			@sale.key.should eq "sale::#{@plant.name}::#{@user.id}"
		end # it
		describe "sales persistance" do 
			let(:sale) { Sale.find @sale.key }
			before :each do 
				@sale.persist
			end # each
			it "should get the sale back out" do 
				sale.plant.should eq @plant
				sale.genre.should eq @sale.genre
			end # it
			describe "material" do 
				before :each do 
					@sale.some(:name => @material.name, :quantity => 100, :units => "pounds", :price => 10).persist
				end # each
				it "should have the sale" do 
					sale.should_not be_nil
				end # it
				it "should have the materials" do 
					sale.materials.should_not be_nil
					sale.materials.should include @material.name
				end # it
				describe "double-up" do 
					before :each do 
						@sale.some(:name => "heroin", :quantity => 150, :units => "tons", :price => 1000000).persist
					end # each
					it "should have 2 materials" do 
						sale.materials.count.should eq 2
					end # it
					it "should contain heroin" do 
						sale.materials.should include "heroin"
					end # it
					describe "finish" do 
						let(:order) { @finish }
						before :each do 
							@finish = lambda do 
								sale.to "acme inc"
							end # each
						end # each
						it "should create a company" do 
							@finish.should change(Company, :count).by 1
						end # it
						it "should create an order" do 
							@finish.should change(Order, :count).by 1
						end # it
						it "should have created material" do 
							@finish.should change(Material, :count).by 2
						end # it
						it "should have the order" do 
							order.should_not be_nil
						end # it
					end # finish
				end # double-up
			end # material
		end # progression
	end # creation
end # Sale