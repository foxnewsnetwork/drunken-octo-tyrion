# == Schema Information
#
# Table name: orders
#
#  id          :integer          not null, primary key
#  company_id  :integer
#  plant_id    :integer
#  carrier     :string(255)
#  external_id :string(255)
#  notes       :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Order < ActiveRecord::Base
  # Accountable features:
  # gross_income, expenses, net_income
  include Accountable
  attr_accessible :carrier, :external_id, :notes
  belongs_to :company # buyer
  belongs_to :plant # seller
  has_many :materials, :as => :buyable, :include => :buyable
  # from Accountable
  implement_income do |order|
    order.materials.inject(0) do |mem, material| 
      mem += material.cost if 0 < material.cost  
    end
  end # implement_income
  implement_expenses do |order|
    order.materials.inject(0) { |mem, material| mem -= material.cost if 0 > material.cost  }
  end # expenses

  def custom_create params
    quantities = params[:quantities].zip(params[:units]).map do |q|
      { :quantity => q.first, :units => q.last }
    end # quantities
    materials = self.plant.materials.where( :name => params[:materials] )
    company = Company.find_or_create_by_name(params[:company])
    order = self.plant.sells(*quantities).of(*materials).at(params[:prices]).to(company)
  end # custom_create
end # Order

class Orderform
  def initialize params
    @prices = params[:prices]
    @quantities = params[:quantities].zip(params[:units]).map do |q|
      { :quantity => q.first, :units => q.last }
    end # quantities
    @materials = params[:materials]
    @company = Company.find_or_create_by_name(params[:company])
  end # initialize

  def generate_order plant
    begin
      order = plant.sells(*@quantities).of(*@materials).at(@prices).to(@company)
    rescue
      nil
    end
  end # generate_order
end # OrderForm