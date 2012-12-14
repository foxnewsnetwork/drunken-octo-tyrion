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
#  genre       :string(255)      default("sale"), not null
#

class Order < ActiveRecord::Base
  ###
  # Tsundere
  ###
  4.times do |n|
    attr_tsundere :fail => '??', :as => n
  end # n
  attr_tsundere :net_income, :expenses, :as => { :accounting => 4 }

  ###
  # Scopes
  ###
  scope :sold, where(:genre => "sale")
  scope :purchased, where(:genre => "purchase")

  ###
  # Accountable
  ###
  # features: gross_income, expenses, net_income
  include Accountable
  # from Accountable
  implement_income do |order|
    order.materials.inject(0) do |mem, material| 
      mem += material.cost if 0 < material.cost  
    end
  end # implement_income
  implement_expenses do |order|
    order.materials.inject(0) { |mem, material| mem -= material.cost if 0 > material.cost  }
  end # expenses

  ###
  # Attributes
  ##
  attr_accessible :carrier, :external_id, :notes

  ###
  # Relationships
  ###
  belongs_to :company # buyer
  belongs_to :plant # seller
  has_many :materials, :as => :buyable, :include => :buyable, :dependent => :destroy
  has_many :connections
  has_many :invoices, :through => :connections
  
  ###
  # Methods
  ###
  def total_weight
    materials.inject(Mass.new 0,"pounds") do |mem, mat|
      mem += Mass.new mat.quantity, mat.units
    end # inject
  end # total_weight

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
      order = plant.sells(*@quantities).of(*@materials).at(*@prices).to(@company)
    rescue
      nil
    end
  end # generate_order
end # OrderForm
