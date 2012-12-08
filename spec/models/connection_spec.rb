# == Schema Information
#
# Table name: connections
#
#  id         :integer          not null, primary key
#  invoice_id :integer
#  order_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'spec_helper'

describe Connection do
  describe "relationships" do 
  	before :each do 
  		@plant = FactoryGirl.create :plant
  		@company = FactoryGirl.create :company
  		@user = FactoryGirl.create :user, :level => 3
  	end # each
  	describe "1 to many" do 
  		before :each do 
	  		@orders = [@plant.sells(100, "pounds").of("heroin").at(150).signed_by(@user).to(@company)]
	  		@orders << @plant.sells(125, "pounds").of("heroin").at(220).signed_by(@user).to(@company)
	  		@invoice = FactoryGirl.create :invoice, :payable => @plant, :receivable => @company
	  		@connect = lambda do
	  			@orders.each do |order|
	  				@invoice.connect_to! order
	  			end # each order
	  		end # connect
  		end # each
  		it "should create 2 connections" do 
  			@connect.should change(Connection, :count).by 2
  		end # it
  		it "should have both orders" do 
  			@connect.call
  			@orders.each do |order|
  				@invoice.orders.should include order 
  			end
  		end # it
  	end # 1 to many
  	describe "many to 1" do 
  		before :each do 
  			@order = @plant.sells(140, "pounds").of("semen").at(1).signed_by(@user).to(@company)
  			@invoices = [FactoryGirl.create( :invoice, :payable => @plant, :receivable => @company)] 
  			@invoices << FactoryGirl.create( :invoice, :payable => @plant, :receivable => @company )
  			@connect = lambda do
  				@invoices.each do |invoice|
  					invoice.connect_to! @order
  				end # each invoice
  			end # lambda
  		end # each
  		it "should create 2 connections" do 
  			@connect.should change(Connection, :count).by 2
  		end # it
  		it "should have both invoices" do 
  			@connect.call
  			@invoices.each do |invoice|
  				@order.invoices.should include invoice
  			end # each invoice
  		end # it
  	end # many to 1
  end # relationshiops
end # Connection
