class PurchasesController < ApplicationController
	respond_to :html, :js, :json
	expose :plant
	expose :orders, :ancestor => :plant do 
		purchases = plant.orders.where(:genre => "purchase")
	end # orders
	expose( :purchase ) do
		if Sale.exist? params[:id]
			Purchase.find params[:id]
		else  
			raise "User Not Signed In Error" unless user_signed_in?
			plant.buys.signed_by(current_user)
		end
	end # sale
	before_filter :allow_sales

	def start
		if purchase.persist!
			flash[:success] = t(:success, :scope => [:purchase, :controller, :start])
		else
			raise "problems saving to redis error"
			flash[:error] = t(:error, :scope => [:purchase, :controller, :start])
		end 			
		respond_with purchase	
	end # start

	def material
		Rails.logger.debug "before units: #{purchase.units} == quantities: #{purchase.quantities}"
		if purchase.some(params[:material]).persist!
			Rails.logger.debug "after units: #{purchase.units} == quantities: #{purchase.quantities}"
			flash[:success] = t(:success, :scope => [:purchase, :controller, :material])
		else
			raise "problems saving to redis error"
			flash[:error] = t(:error, :scope => [:purchase, :controller, :material])
		end
		respond_with purchase
	end # material

	def finish
		order = purchase.to params[:company]
		throw order unless order.is_a? Order
		unless order.nil?
			flash[:success] = t(:success, :scope => [:purchase, :controller, :finish])
			purchase.delete
		else
			raise "Problems finalizing the purchases order"
			flash[:error] = t(:error, :scope => [:purchase, :controller, :finish])
		end
		respond_with order
	end # finish
end
