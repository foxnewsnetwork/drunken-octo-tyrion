require 'spec_helper'

describe InvoicesController do
	standard_setup
	login_user :accounting
	describe "get" do 
		before :each do
			@invoice = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
			@invoice.save
		end # each
		describe "show" do 
			it "should be successful" do
				get "show", :id => @invoice.id
				response.should be_success
			end # it
		end # show
		describe "edit" do 
			it "should be successful" do
				get "edit", :id => @invoice.id
				response.should be_success
			end # it
		end # edit
		describe "order-index" do 
			it "shoudl be successful" do
				get "index", :order_id => @order.id
				response.should be_success
			end # it
		end # order-index
	end # get
	describe "put" do 
		before :each do
			@invoice = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
			@invoice.save
		end # each
		describe "update" do 
			let(:invoice) { Invoice.find(@invoice.id) }
			before :each do 
				@attributes = { :amount => 1, :notes => "some bs" }
				@update = lambda do
					put :update, :id => @invoice.id, :invoice => @attributes
				end # update
			end # each
			it "not be null" do 
				@invoice.should_not be_nil
				@invoice.id.should_not be_nil
			end # it
			it "should change the invoice" do
				@update.call
				controller.invoice.amount.to_s.should eq 1.0.to_s
			end # it
			it "should change the notes" do 
				@update.call
				controller.invoice.notes.should eq "some bs"
			end # it
		end # update
	end # put
	describe "post" do 
		describe "connect" do 
			before :each do
				@invoice = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
				@invoice.save
				@order = @plant.sells(100, "tons").of("heroin").at(500).to(@company)
				@connect = lambda do
					post :connect, :id => @invoice.id, :order_id => @order.id
				end # connect
			end # each
			it "should create a connection" do 
				@connect.should change(Connection, :count).by 1
			end # it
			it "should relate" do 
				@connect.call
				controller.invoice.orders.should include @order
			end # it
		end # connect
	end # post
end # Invoices
