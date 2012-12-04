# The sale class is an intermediary between transaction and controller
class Sale 

	def initialize plant, params
		@plant = plant
		unless params.nil?
			@materials = params[:materials].map { |material| material[:name] }
			@prices = params[:materials].map { |material| material[:price] }
			@quantities = params.delete(:materials).map { |material| { :quantity => material[:quantity], :units => material[:units] } }
			@company = params.delete :company
			@order_attr = params
		end
	end # initialize

	def generate_order
		begin
			@plant.sells(*@quantities).of(*@materials).at(*@prices).to(@company)
		rescue
			Rails.logger.debug "Unable to create order from given specs: "
			Rails.logger.debug instance_variables.inject("") { |mem, var| mem + " === " + var.to_s }
			nil
		end 
	end # generate_order
end # sale