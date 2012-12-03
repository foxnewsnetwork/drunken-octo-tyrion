class TransactionsController < ApplicationController	
	respond_to :html, :js, :json
	before_filter :allow_sales
	def create
		@plant = Plant.find(params[:plant_id])
		@transaction = Orderform.new params[:transaction]
		@order = @transaction.generate_order @plant
		unless @order.nil?
			flash[:success] = t(:success, :scope => [:transaction, :controllers, :create])
		else
			flash[:error] = t(:error, :scope => [:transaction, :controllers, :create])
		end # 
		respond_with @order
	end # create
end # TransactionController

