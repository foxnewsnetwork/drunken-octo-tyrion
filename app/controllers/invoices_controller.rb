class InvoicesController < ApplicationController
	###
	# Responses
	###
	respond_to :json, :js, :html, :xml

	###
	# decent exposures
	###
	expose(:parent) do
		if params.has_key? :plant_id
			Plant.find params[:plant_id]
		elsif params.has_key? :order_id
			Order.find params[:order_id]
		else
			# throw "bad input parameters error for parent"
			nil
		end
	end # parent
	expose(:invoices) do
		i = {}
		if parent.is_a? Order
			i[:outgoing] = parent.invoices 
		elsif parent.is_a? Plant
			i[:incoming] = parent.incoming_invoices
			i[:outgoing] = parent.outgoing_invoices 
		else
			# throw "bad input parameters error for invoices"
			nil
		end
	end # invoices
	expose(:invoice) do 
		if params[:id].nil?
			Invoice.new params[:invoice]
		else
			Invoice.find params[:id]
		end
	end # invoice

	###
	# filters
	###
	before_filter :allow_accounting

	###
	# methods
	###

	def from 
		invoice.from(Company.find params[:company_id]).to @plant
		if invoice.save
			flash[:success] = t(:success, :scope => [:invoice, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:invoice, :controller, :update])
		end # update
		respond_with invoice
	end # from 

	def to
		invoice.to(Company.find params[:company_id]).from @plant
		if invoice.save
			flash[:success] = t(:success, :scope => [:invoice, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:invoice, :controller, :update])
		end # update
		respond_with invoice
	end # to

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
			flash[:error] = t(:error, :scope => [:invoice, :controller, :update])
		end # update
		respond_with invoice
	end # update

	def create
		if invoice.save
			flash[:success] = t(:success, :scope => [:invoice, :controller, :create])
		else
			flash[:error] = t(:error, :scope => [:invoice, :controller, :create])
		end # save
		respond_with invoice
	end # create
end # Invoicescontroller
