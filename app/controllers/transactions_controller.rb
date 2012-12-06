class TransactionsController < ApplicationController	
	respond_to :html, :js, :json, :xml 
	expose(:plant)
	expose(:transaction) { Transaction.find params[:transaction] }
	before_filter :allow_sales
	def materialize
		transaction.some params[:material]
		if transaction.persist
			flash[:success] = t(:success, :scope => [:transaction, :controllers, :create])
		else
			flash[:error] = t(:error, :scope => [:transaction, :controllers, :create])
		end # if
		respond_with transaction
	end # create

	def finish
		order = transaction.to params[:company]
		unless order.nil?
			flash[:success] = t(:success, :scope => [:transaction, :controllers, :finish])
		else
			flash[:error] = t(:error, :scope => [:transaction, :controllers, :finish])
		end # if
		respond_with order
	end # finish
end # TransactionController

