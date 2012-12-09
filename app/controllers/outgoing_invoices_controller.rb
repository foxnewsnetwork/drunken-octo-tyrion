class OutgoingInvoicesController < InvoicesController
	###
	# Responses
	###
	# respond_to :json, :js, :html, :xml

	###
	# decent exposures
	###
	expose(:plant)
	expose(:outgoings) do
		plant.outgoing_invoices
	end # outgoings
	expose(:outgoing) do 
		if params.has_key? :id
			Invoice.find_by_id params[:id]
		else
			plant.outgoing_invoices.new params[:invoice]
		end 
	end # outgoing

	###
	# filters
	###
	# before_filter :allow_accounting

	###
	# Methods
	###
	def to
		outgoing.to(Company.find_or_create_by_name params[:company_name]).from plant
		if outgoing.save
			flash[:success] = t(:success, :scope => [:outgoing, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:outgoing, :controller, :update])
		end # update
		respond_with outgoing
	end # to

	def create
		Rails.logger.debug "Attempting to create: #{outgoing.to_json}"
		if outgoing.save
			flash[:success] = t(:success, :scope => [:outgoing, :controller, :create])
		else
			flash[:error] = t(:error, :scope => [:outgoing, :controller, :create])
		end # save
		respond_with outgoing
	end # create
end # to
