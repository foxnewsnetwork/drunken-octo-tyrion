require 'spec_helper'

describe Purchase do 
	describe "Sanity" do 
		it "should be there" do 
			Purchase.should_not be_nil
		end # it
	end # sanity
	describe "creation" do 
		standard_setup :price
		before :each do 
			@user = FactoryGirl.create :user, :level => 4
			@purchase = Purchase.new( @plant).signed_by @user
		end # each
		it "should be there" do 
			@purchase.should_not be_nil
		end # it
		it "should get the right key" do 
			@purchase.key.should eq "purchase-#{@plant.id}-#{@user.id}"
		end # it
		describe "sales persistance" do 
			let(:purchase) { Purchase.find @purchase.key }
			before :each do 
				@purchase.persist
			end # each
			it "should get the purchase back out" do 
				purchase.plant.should eq @plant
				purchase.genre.should eq @purchase.genre
			end # it
			describe "material" do 
				before :each do 
					@purchase.some(:name => @material.name, :quantity => 100, :units => "pounds", :price => 10).persist
				end # each
				it "should have the purchase" do 
					purchase.should_not be_nil
				end # it
				it "should have the materials" do 
					purchase.materials.should_not be_nil
					purchase.materials.should include @material.name
				end # it
				describe "triple-up" do 
					before :each do 
						@purchase.some(:name => "heroin", :quantity => 150, :units => "tons", :price => 1000000).persist
						@purchase.some(:name => "crack", :quantity => 150, :units => "tons", :price => 1000000).persist
					end # each
					it "should have 2 materials" do 
						purchase.materials.count.should eq 3
					end # it
					it "should contain heroin" do 
						purchase.materials.should include "heroin"
					end # it
					it 'should all match count' do 
						purchase.quantities.count.should eq purchase.units.count
						purchase.units.count.should eq purchase.prices.count
						purchase.prices.count.should eq purchase.materials.count
					end # it
					describe "finish" do 
						let(:order) { @finish.call }
						before :each do 
							@finish = lambda do 
								purchase.to "acme inc"
							end # each
						end # each
						it "should create a company" do 
							@finish.should change(Company, :count).by 1
						end # it
						it "should create an order" do 
							@finish.should change(Order, :count).by 1
						end # it
						it "should have created material" do 
							@finish.should change(Material, :count).by 3
						end # it
						it "should have the order" do 
							order.class.should eq Order
							order.should_not be_nil
						end # it
					end # finish
				end # double-up
			end # material
		end # progression
	end # creation
end # purchase