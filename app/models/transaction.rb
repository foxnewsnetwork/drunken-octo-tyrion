##
# Non-db-backed model
##

class Transaction
	attr_accessor :plant, :company, :volumes, :storage, :errors
	attr_reader :ready_checks

	def implement_check &block
		@ready_checks ||= []
		@ready_checks << block
	end # implement_check

	# qs = [{ 100 => 'lbs'}, {200 => 'tons'}]
	def initialize subject, *qs
		initialize_errors
		initialize_readies
		initialize_subject subject
		initialize_volumes *qs
	end # initialize

	def of *materials
		Rails.logger.debug "of material"
		if materials.count != volumes.count
			@errors[:mismatch] = "Mismatch count error"
		end # if
		@materials = materials
		return self
	end # of

	def at *prices
		Rails.logger.debug "at price"
		if prices.count != volumes.count
			@errors[:mismatch] = "Mismatch price error"
		end # if
		@prices = prices
		return self
	end # price

	def from p 
		@plant = p
		@errors.delete :plant 
		initialize_storage
		return create_order if ready? 
		nil
	end # from

	def to c
		@company = c
		@errors.delete :company
		initialize_storage
		return create_order if ready?
		nil
	end # to

	def ready?
		okay_flag = true
		ready_checks.each do |check|
			if check.call(self) != true
				okay_flag = false 
				break
			end
		end unless @ready_checks.nil? # read_checks
		okay_flag
	end # ready?
	
	private
	def initialize_storage
		Rails.logger.debug "initialize_storage"
		@storage = {}
		@materials.count.times do |k|
			Rails.logger.debug "Materials List: "
			Rails.logger.debug @materials.to_s
			Rails.logger.debug "Prices List: "
			Rails.logger.debug @prices.to_s
			@storage[@materials[k].name] = volumes[k].merge :material => @materials[k], :unit_price => @prices[k]
			@errors.delete :material if @errors.has_key? :material 
			@errors.delete :price if @errors.has_key? :price 
		end 
	end # initialize_storage

	def initialize_readies
		implement_check do |trans|
			if trans.errors.empty?
				true
			else
				throw "You have the following errors: " + trans.errors.inject( "" ){ |m, b| m + ": " + b.last + "\n" } 
				false
			end
		end # implement_check

		implement_check do |trans|
			okay_flag = true
			trans.storage.map { |key,hash| hash[:material] }.each do |material|
				if material.buyable_type != "Plant" or material.buyable_id != trans.plant.id
					Rails.logger.debug "Plant doesn't have the material requested: type-#{material.buyable_type}, id-#{material.buyable_id}"
					okay_flag = false 
					break
				end
			end # each material
			okay_flag
		end # check trans
	end # initialzie_readies

	def initialize_subject subject
		case subject.class.to_s
		when Plant.to_s
			@plant = subject
			@errors.delete :plant
		when Company.to_s
			@company = subject
			@errors.delete :company
		else
			raise "Unrecognized transaction initiator error: #{subject.class.to_s}"
		end # case
	end # subject

	def initialize_volumes *qs
		@volumes = []
		qs.each do |q|
			unless q.has_key? :quantity and q.has_key? :units
				throw "bad input exception. Correct format is qs = [{ :quantity => integer, :units => string },...]" 
			end # unless
			@volumes << q
		end # each qs
	end # volumes

	def initialize_errors
		@errors = {
			:price => "No price specified" ,
			:plant => "No plant specified" ,
			:material => "No material specified" ,
			:company => "No company specified"
		}
	end # initialize_errors

	def create_order
		order = company.orders.new
		order.plant_id = plant.id
		if order.save
			storage.each do |name, status|
				order.materials.create! status.reject { |k| k == :material }.merge(:name => name)
			end # each m
		else
			throw "Unable to process ordered materials error"
		end # if save
		return order
	end # create_order
end # Transaction