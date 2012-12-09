class InvoicesController < ApplicationController
	###
	# Responses
	###
	respond_to :json, :js, :html, :xml

	###
	# decent exposures
	###
	expose(:order) do
		Order.find_by_id params[:order_id]
	end # parent
	expose(:invoices) do
		order.invoices unless order.nil?
	end # invoices
	expose(:invoice) do 
		Invoice.find_by_id params[:id]
	end # invoice

	###
	# filters
	###
	before_filter :allow_accounting

	###
	# methods
	###

	def connect
		if invoice.connect_to! params[:order_id]
			flash[:success] = t(:success, :scope => [:invoice, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:invoice, :controller, :update])
		end # update
		respond_with invoice
	end # connect

	def update
		if invoice.update_attributes params[:invoice]
			flash[:success] = t(:success, :scope => [:invoice, :controller, :update])
		else
			throw "update failed"
			flash[:error] = t(:error, :scope => [:invoice, :controller, :update])
		end # update
		respond_with invoice
	end # update

	
end # Invoicescontroller
