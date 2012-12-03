class OrdersController < ApplicationController
	expose(:plant) { Plant.find params[:plant_id] }
	expose :orders, :ancestor => :plant
	expose :order
	before_filter :allow_sales, :only => [:create, :update, :destroy]
	before_filter :allow_management, :only => [:approve]

	def update
		if order.save
			flash[:success] = t(:success, :scope => [:order, :controllers, :update, :flash])
			redirect_to plant_order_path( plant, order)
		else
			flash.now[:error] = t(:error, :scope => [:order, :controllers, :update, :flash])
			render :edit
		end
	end # update

	def destroy
		if order.destroy
			flash[:success] = t(:success, :scope => [:order, :controllers, :destroys, :flash])
			redirect_to plant_orders_path(plant)
		else
			flash.now[:error] = t(:error, :scope => [:order, :controllers, :destroys, :flash])
			render :index
		end
	end # destroy

	def approve
		raise "Approval Not Implemented Exception"
	end # approve
end # ordersController
