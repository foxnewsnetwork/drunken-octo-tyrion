# == Schema Information
#
# Table name: invoices
#
#  id              :integer          not null, primary key
#  genre           :string(255)
#  notes           :text
#  pay_method      :string(255)
#  amount          :decimal(12, 2)
#  payable_id      :integer
#  payable_type    :string(255)
#  receivable_id   :integer
#  receivable_type :string(255)
#  status          :string(255)      default("out"), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require 'spec_helper'

describe Invoice do
	before :each do 
		@plant = FactoryGirl.create :plant
		@user = FactoryGirl.create :user, :level => 4
		@company = FactoryGirl.create :company
	end # each
	describe "relationships" do 
		before :each do 
			@invoice = FactoryGirl.create :invoice, :payable => @plant, :receivable => @company
		end # each
		it "should be the plant" do 
			@invoice.payable.should eq @plant
		end # it
		it "should be the company" do 
			@invoice.receivable.should eq @company
		end # it
	end # relationships
	describe "inverse relationship" do 
		before :each do 
			@incoming_invoice = FactoryGirl.create :invoice, :payable => @plant, :receivable => @company
			@outgoing_invoice = FactoryGirl.create :invoice, :payable => @company, :receivable => @plant
		end # each
		it "should get the stuff for the plant" do 
			@plant.outgoing_invoices.should include @outgoing_invoice
		end # it
		it "should get the incoming invoice for the plant" do 
			@plant.incoming_invoices.should include @incoming_invoice
		end # it
		it "should get the company" do 
			@company.outgoing_invoices.should include @incoming_invoice
		end # it
		it "should get the incoming invoice for the plant" do 
			@company.incoming_invoices.should include @outgoing_invoice
		end # it
	end # inverse
	describe "money" do 
		before :each do
			@attributes = FactoryGirl.attributes_for :invoice
			10.times do 
				invoice = Invoice.new(@attributes).from(@plant).to(@company)
				(@invoices ||= []) << invoice if invoice.save!
			end # 10 times
		end # each
		it "should not be empty" do 
			@invoices.count.should eq 10
			@invoices.each do |invoice|
				invoice.payable.should eq @company
				invoice.receivable.should eq @plant
			end # each invoice
		end # it
		it "should have 0 actual income" do 
			@plant.actual_income.should eq 0
		end # it
		it "should have a bunch of expected income" do 
			@plant.expected_income.to_s.should eq (@invoices.first.amount*10).to_s
		end # it
		[:actual_expenses, :expected_expenses, :predicted_expenses].each do |type|
			it "should have 0 expenses of the #{type} kind" do 
				@plant.send(type).to_s.should eq 0.to_s
			end # it
		end # each type
		it "should have no orders" do 
			@plant.orders.should be_empty
		end # it
		it "should have no incoming invoices" do 
			@plant.incoming_invoices.count.should eq 0
		end # it
		it "should have 10 outgoing_invoices" do 
			@plant.outgoing_invoices.count.should eq 10
		end # it
		it "should not equal count" do 
			@plant.outgoing_invoices.count.should_not eq @plant.incoming_invoices.count
		end # it
	end # money
end # Invoice
