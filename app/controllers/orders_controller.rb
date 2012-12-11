class OrdersController < ApplicationController
	respond_to :js, :json, :xml, :html
	expose :order
	expose(:material) do 
		order.materials.build params[:material] unless order.nil?
	end # material
	before_filter :allow_sales, :only => [:update_order, :update, :destroy]
	before_filter :allow_management, :only => [:approve]

	def update
		if order.save
			flash.now[:success] = t(:success, :scope => [:order, :controllers, :update])
# 			redirect_to plant_order_path( plant, order)
		else
			flash.now[:error] = t(:error, :scope => [:order, :controllers, :update])
#			render :edit
		end
		respond_with order
	end # update

	def destroy
		if order.destroy
			flash[:success] = t(:success, :scope => [:order, :controllers, :destroys])
#			redirect_to plant_orders_path(plant)
		else
			flash[:error] = t(:error, :scope => [:order, :controllers, :destroys])
#			render :index
		end
		redirect_to :back
	end # destroy

	# Yes, I realize it's bad to make materials in an order controller, but meh
	def update_material
		if material.save
			flash.now[:success] = t(:success, :scope => [:order, :controllers, :create])
		else
			flash.now[:error] = t(:error, :scope => [:order, :controllers, :create])
		end
		respond_with order
	end # create
end # ordersController
