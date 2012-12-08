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
		describe "plant-new" do 
			it "should be successful" do
				get "new_outgoing", :plant_id => @plant.id
				response.should be_success
			end # it
			it "should be successful" do
				get "new_incoming", :plant_id => @plant.id
				response.should be_success
			end # it
		end # plant-new
		describe "plant-index" do 
			it "should be successful" do
				get "index", :plant_id => @plant.id
				response.should be_success
			end # it
		end # plant-index
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
			it "should change the invoice" do
				@update.should change(controller.invoice, :amount).to(BigDecimal.new 1)
			end # it
			it "should change the notes" do 
				@update.should change(controller.invoice, :notes).to "some bs"
			end # it
		end # update
	end # put
	describe "post" do
		describe "from" do 
			before :each do
				@invoice = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
				@invoice.save
				@from = lambda do
					post :from, :id => @invoice.id, :company_id => @company.id
				end # from
			end # each
			it "should hook up" do 
				@from.call
				controller.invoice.receivable.should eq @company
			end # it
		end # from
		describe "to" do 
			before :each do
				@invoice = Invoice.create(FactoryGirl.attributes_for :invoice).from(@plant).to(@company)
				@invoice.save
				@to = lambda do
					post :to, :id => @invoice.id, :company_id => @company.id
				end # from
			end # each
			it "should hook up" do 
				@to.call
				controller.invoice.payable.should eq @company
			end # it
		end # to
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
end # Invoices
