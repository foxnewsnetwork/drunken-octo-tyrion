class IncomingInvoicesController < InvoicesController
	###
	# Responses
	###
	# respond_to :json, :js, :html, :xml

	###
	# decent exposures
	###
	expose(:plant)
	expose(:incomings) do
		plant.incoming_invoices
	end # incomings
	expose(:incoming) do 
		if params.has_key? :id
			Invoice.find_by_id params[:id]
		else
			plant.incoming_invoices.new params[:invoice]
		end # 
	end # incoming

	###
	# filters
	###
	# before_filter :allow_accounting

	###
	# Methods
	###
	def from 
		incoming.from(Company.find_or_create_by_name params[:company_name]).to plant
		if incoming.save
			flash[:success] = t(:success, :scope => [:incoming, :controller, :update])
		else
			flash[:error] = t(:error, :scope => [:incoming, :controller, :update])
		end # update
		respond_with incoming
	end # from 

	def create
		
		if incoming.save
			flash[:success] = t(:success, :scope => [:incoming, :controller, :create])
		else
			flash[:error] = t(:error, :scope => [:incoming, :controller, :create])
		end # save
		respond_with incoming
	end # create
end
