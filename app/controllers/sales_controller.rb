class SalesController < ApplicationController
	respond_to :html, :js, :json
	expose :plant
	expose :orders, :ancestor => :plant do 
		sales = plant.orders.where(:genre => "sale")
	end # orders
	expose( :sale ) do
		if params.has_key? :id
			Sale.find params[:id]
		else  
			raise "User Not Signed In Error" unless user_signed_in?
			plant.sells.signed_by(current_user)
		end
	end # sale
	before_filter :allow_sales

	def create
		if sale.persist!
			flash[:success] = t(:success, :scope => [:sale, :controller, :create])
		else
			raise "problems saving to redis error"
			flash[:error] = t(:error, :scope => [:sale, :controller, :create])
		end 			
		respond_with sale	
	end # create

	def material
		Rails.logger.debug "before units: #{sale.units} == quantities: #{sale.quantities}"
		if sale.some(params[:material]).persist!
			Rails.logger.debug "after units: #{sale.units} == quantities: #{sale.quantities}"
			flash[:success] = t(:success, :scope => [:sale, :controller, :material])
		else
			raise "problems saving to redis error"
			flash[:error] = t(:error, :scope => [:sale, :controller, :material])
		end
		respond_with sale
	end # material

	def finish
		order = sale.to params[:company]
		throw order unless order.is_a? Order
		unless order.nil?
			flash[:success] = t(:success, :scope => [:sale, :controller, :finish])
		else
			raise "Problems finalizing the sales order"
			flash[:error] = t(:error, :scope => [:sale, :controller, :finish])
		end
		respond_with order
	end # finish
end # sales
