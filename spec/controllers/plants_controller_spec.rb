require 'spec_helper'

describe PlantsController do
	describe "gets" do 
		login_user 3
		before :each do 
			@plant = FactoryGirl.create :plant
		end # each
		it "should get show" do 
			get "show", :id => @plant 
			response.should be_success
		end # show
		it "should get new" do 
			get "new"
			response.should be_success
		end # show
		it "should get edit" do 
			get "edit", :id => @plant 
			response.should be_success
		end # show
		it "should get index" do 
			get "index"
			response.should be_success
		end # index
	end # gets
	describe "update" do 
		login_user 5
		before :each do 
			@plant = FactoryGirl.create :plant 
			@attributes = FactoryGirl.attributes_for(:plant)
			@update = lambda { put :update, :id => @plant.id, :plant => @attributes } 
		end # each
		describe "changes" do 
			let(:plant) { Plant.find(@plant) }
			FactoryGirl.attributes_for(:plant).each do |key, val|
				it "should have #{key}" do 
					@attributes[key].should_not be_nil
				end # it
				it "should change #{key}" do 
					@update.call
					controller.plant[key].should eq @attributes[key]
				end # it
			end  # each attr
		end # changes
	end # update
	describe "creation" do 
		before :each do 
			@plant = FactoryGirl.attributes_for :plant 
			@create = lambda { post :create, :plant => @plant }
		end # each
		context "as management" do
			login_user 5
			it "should create" do 
				@create.should change(Plant, :count).by 1
			end # it

			it "should redirect" do 
				@create.call
				response.should redirect_to plant_path(controller.plant)
			end # it
			it "should show flash" do 
				@create.call
				flash[:success].should_not be_blank
			end # it
		end # as management
		4.times do |n|
			context "as someone else #{n+1}" do 
				login_user( n + 1 )
				it "should not change #{n+1}" do 
					@create.should_not change(Plant, :count)
				end # it
				it "should redirect #{n+1}" do 
					@create.call
					response.should redirect_to new_user_session_path
				end # it
			end # as someone else
		end # n
	end # creation
end # Plants
