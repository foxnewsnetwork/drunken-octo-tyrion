class SalesController < ApplicationController
	respond_to :html, :js, :json
	expose :plant
	expose :orders, :ancestor => :plant do 
		plant.orders.where(:genre => "sales")
	end # orders
	expose( :sale ){ Sale.new(plant, params[:sale]) }
	before_filter :allow_sales

	def create
		order = sale.generate_order
		unless order.nil?
			flash[:success] = t(:success, :scope => [:sale, :controller, :create])
		else
			throw "failed generate error"
			flash[:error] = t(:error, :scope => [:sale, :controller, :create])
		end 			
		respond_with order	
	end # create
end # sales
