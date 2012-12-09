require 'spec_helper'

describe IncomingInvoicesController do
	standard_setup
	login_user :accounting
	describe "plant-new" do 
		it "should be successful" do
			get "new", :plant_id => @plant.id
			response.should be_success
		end # it
	end # plant-new
	describe "plant-index" do 
		it "should be successful" do
			get "index", :plant_id => @plant.id
			response.should be_success
		end # it
	end # plant-index

	describe "post" do
		describe "from" do 
			before :each do
				@incoming = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
				@incoming.save
				@from = lambda do
					post :from, :plant_id => @plant.id, :id => @incoming.id, :company_name => @company.name
				end # from
			end # each
			it "should hook up" do 
				@from.call
				controller.incoming.receivable.should eq @company
			end # it
		end # from
		describe "plant-create" do 
			before :each do 
				@attributes = FactoryGirl.attributes_for :invoice
				@create = lambda do 
					post :create, :plant_id => @plant.id, :invoice => @attributes
				end # create
			end # each
			it "should change the db" do 
				@create.should change(Invoice, :count).by 1
			end # it
		end # plant-create
	end # post
end
