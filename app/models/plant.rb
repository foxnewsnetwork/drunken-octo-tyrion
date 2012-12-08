# == Schema Information
#
# Table name: plants
#
#  id            :integer          not null, primary key
#  name          :string(255)
#  country       :string(255)
#  state         :string(255)
#  city          :string(255)
#  address       :string(255)
#  sqft          :integer
#  founding_date :date
#  closing_date  :date
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Plant < ActiveRecord::Base
  ###
  # Attributes
  ###
  attr_accessible :name, :country, :state, :city, :address, :sqft, :founding_date, :closing_date
  
  ###
  # Relationships
  ###
  has_many :outgoing_invoices, :as => :receivable, :class_name => "Invoice"
  has_many :incoming_invoices, :as => :payable, :class_name => "Invoice"
  has_many :materials, :as => :buyable
  has_many :orders do 
    def sales
      where(:genre => "sale")
    end # sales
    def purchases
      where(:genre => "purchase")
    end # purchases
    def from time
      where("created_at > ?", time || 100.years.ago)
    end # from
    def to time
      where("created_at < ?", time || 1.second.ago)
    end # to
  end # orders

  ###
  # Accountable package
  ###
  include Accountable
  implement_income do |plant|
    plant.orders.inject(0) { |mem, order| mem += order.gross_income }
  end # income
  implement_expenses do |plant|
    plant.orders.inject(0) { |mem, order| mem += order.expenses }
  end # expenses

  ###
  # Methods
  ###
  # qs = [quantity, units]
  # qs = [{:quantity => , :units =>}, ...]
  def sells *qs
		if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
			Sale.new self, :quantity => qs.first, :units => qs.last
		else
      Sale.new self, *qs
    end
  end # sells

  def buys *qs
    if qs.first.is_a? Integer or qs.first.is_a? Float and qs.last.is_a? String
      Purchase.new self, :quantity => qs.first, :units => qs.last
    else
      Purchase.new self, *qs
    end
  end # buys

  alias_method :predicted_income, :net_income
  alias_method :predicted_expenses, :expenses
  
  def actual_income
    outgoing_invoices.where(:status => "deposited").inject(0) do |mem, invoice|
      mem += invoice.amount
    end # inject invoice
  end # actual_income

  def expected_income
    outgoing_invoices.inject(0) { |m,i| m += i.amount }
  end # received_income

  def actual_expenses
    incoming_invoices.where(:status => "paid").inject(0) do |mem, invoice|
      mem += invoice.amount
    end # inject invoice
  end # actual_expenses

  def expected_expenses
    incoming_invoices.inject(0) { |m,i| m += i.amount }
  end # expected_expenses

end # Plant


