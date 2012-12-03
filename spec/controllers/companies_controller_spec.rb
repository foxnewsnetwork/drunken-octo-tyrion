require 'spec_helper'

describe CompaniesController do
	describe "creation" do 
		before :each do 
			@company = FactoryGirl.attributes_for :company 
			@create = lambda { post :create, :company => @company }
		end # each
		context "as management" do
			login_user 5
			it "should create" do 
				@create.should change(Company, :count).by 1
			end # it

			it "should redirect" do 
				@create.call
				response.should redirect_to company_path(controller.company)
			end # it
			it "should show flash" do 
				@create.call
				flash[:success].should_not be_blank
			end # it
		end # as management
		2.times do |n|
			context "as someone else #{n+1}" do 
				login_user( n + 1 )
				it "should not change #{n+1}" do 
					@create.should_not change(Company, :count)
				end # it
				it "should redirect #{n+1}" do 
					@create.call
					response.should redirect_to new_user_session_path
				end # it
			end # as someone else
		end # n
	end # creation
end
