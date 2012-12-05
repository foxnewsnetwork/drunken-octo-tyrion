##
# Non-db-backed model
##
# If we ever get big, we might need to persist this into a db
# instead of just ram

class Transaction
	include TemporaryRecord
	attr_accessor :plant, :company, :volumes, :storage, :errors, :genre
	attr_reader :ready_checks

	def implement_check &block
		@ready_checks ||= []
		@ready_checks << block
	end # implement_check

	# qs = [{ 100 => 'lbs'}, {200 => 'tons'}]
	def initialize subject, genre, *qs
		initialize_errors
		initialize_readies
		initialize_subject subject, genre
		initialize_volumes *qs unless qs.empty?
	end # initialize

	# stuff = [{:name => , :quantity => , :units => , :price => }]
	def some *stuff
		initialize_volumes *(stuff.map { |hash| {:quantity => hash[:quantity], :units => hash[:units]} })
		self.of *(stuff.map { |hash| hash[:name] })
		self.at *(stuff.map { |hash| hash[:price] })
	end # some

	def of *materials
		Rails.logger.debug "of material"
		materials.each do |material|
			(@materials ||= []) << material
		end
		return self
	end # of

	def at *prices
		Rails.logger.debug "at price"
		prices.each do |price|
			(@prices ||= []) << price
		end # prices
		return self
	end # price

	def from p 
		@plant = p
		@errors.delete :plant 
		mismatch_check
		initialize_storage
		return create_order if ready? 
		nil
	end # from

	def to c
		@company = c
		@errors.delete :company
		mismatch_check
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
	def mismatch_check
		if @materials.count != volumes.count
			@errors[:mismatch] = "Mismatch count error"
		end # if
		if @prices.count > volumes.count
			@errors[:mismatch] = "Mismatch price error"
		end # if
	end # mismatch_check

	def initialize_storage
		Rails.logger.debug "initialize_storage"
		unless @company.is_a? Company
			@company = Company.find_by_name(@company)
			@errors[:company] = "no such company" if @company.nil?
		end # company
		@materials = @materials.map do |material| 
			if material.is_a? Material
				material 
			elsif material.is_a? String
				@plant.materials.find_by_name(material)
			else
				nil
			end
		end # materials
		@storage = {}
		@materials.count.times do |k|
			Rails.logger.debug "Materials List: "
			Rails.logger.debug @materials.to_s
			Rails.logger.debug "Prices List: "
			Rails.logger.debug @prices.to_s
			case genre
			when "sale"
				@storage[@materials[k].name] = volumes[k].merge :material => @materials[k], :unit_price => @prices[k]
			when "purchase"
				@storage[@materials[k].name] = volumes[k].merge :material => @materials[k], :unit_price => -@prices[k]
			else
				@errors[:genre] = "bad genre error #{genre}"
			end # genre
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
				if material.nil? or material.buyable_type != "Plant" or material.buyable_id != trans.plant.id
					Rails.logger.debug "Plant doesn't have the material requested: type-#{material.buyable_type}, id-#{material.buyable_id}"
					okay_flag = false 
					break
				end
			end # each material
			okay_flag
		end # check trans
	end # initialzie_readies

	def initialize_subject subject, g
		case subject.class.to_s
		when Plant.to_s
			@plant = subject
			@genre = g
			@errors.delete :plant
		when Company.to_s
			@company = subject
			@genre = g
			@errors.delete :company
		else
			raise "Unrecognized transaction initiator error: #{subject.class.to_s}"
		end # case
	end # subject

	def initialize_volumes *qs
		@volumes ||= []
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