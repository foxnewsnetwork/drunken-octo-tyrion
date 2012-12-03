require 'spec_helper'

describe PlantsController do
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
