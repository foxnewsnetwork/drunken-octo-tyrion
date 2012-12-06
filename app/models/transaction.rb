##
# Non-db-backed model
##
# If we ever get big, we might need to persist this into a db
# instead of just ram

class Transaction
	###
	# TemporaryRecord
	###
	include TemporaryRecord

	def key
		"transaction#{plant.name}#{company}#{genre}#{user.nil? ? 12 : user.id}"
	end

	def serialize
		hash = {}
		pull_name = lambda do |thing| 
			if thing.respond_to? :name 
				thing.name 
			elsif thing.is_a? Hash and thing.has_key? :name
				thing[:name]
			elsif thing.is_a? String
				thing
			elsif thing.responds_to? :id
				thing[:id]
			else
				throw "Serialization has gone wrong #{thing}"
			end
		end
		{ :plant => plant, :company => company, :genre => genre , :user => user }.each do |k, v|
			hash[k] = pull_name.call v unless v.nil? or v.blank?
		end # each k,v
		{ :units => units, :materials => materials, :quantities => quantities, :prices => prices }.each do |key, array|
			# hash[key] = array.inject("") { |mem, c| mem + c.to_s + "==--==" }.chomp("==--==") unless array.nil? or array.empty?
			hash[key] = array unless array.nil? or array.empty?
		end # each key, array
		Rails.logger.debug "Serialization Hash: "
		Rails.logger.debug hash.to_s
		return hash
	end # serialize

	def self.deserialize hash
		if hash.has_key? "company"
			subject = Company.find_by_name hash["company"]
		elsif hash.has_key? "plant"
			subject = Plant.find_by_name hash["plant"]
		else
			throw "No plant or company error"
		end
		throw "Bad data error, no genre" unless hash.has_key? "genre"
		transaction = new subject, hash["genre"]
		Rails.logger.debug "Deserialization Hash: "
		Rails.logger.debug hash.to_s
		hash.each do |k,v|
			case k
			when "user"
				transaction.signed_by User.find_by_name v
			when "genre"
				next
			when "plant"
				transaction.from Plant.find_by_name v
			when "company"
				transaction.to Company.find_by_name v
			when "materials"
				transaction.of *v # *(v.split("==--=="))
			when "quantities"
				transaction.amounts *v # *(v.split("==--=="))
			when "prices"
				transaction.at *v # *(v.split("==--=="))
			when "units"
				transaction.metrics *v # *(v.split("==--=="))
			else
				throw "Bad deserialization error, no such key #{k} => #{v}"
			end # k
		end # each k,v
		return transaction
	end # dserialize

	###
	# Attr_reader
	###
	attr_reader :prices, :quantities, :units, :materials, :plant, :company, :genre, :errors
	attr_accessor :user

	###
	# Interface
	###
	def initialize subject, genre, *qs 
		initialize_errors
		initialize_readies
		initialize_subject subject, genre
		initialize_volumes *qs unless qs.empty?
		ready_generate
	end # initialize
	def amounts *qs
		initialize_volumes *(qs.map(&:to_f))
		ready_generate
	end # quantities
	def metrics *ms 
		initialize_volumes *(ms.map(&:to_s))
		ready_generate
	end # metrics
	def of *ms 
		ms.each do |material|
			(@materials ||= []) << material
		end 
		@errors.delete :material
		ready_generate
	end # of
	def at *ps 
		ps.each do |price|
			(@prices ||= []) << price.to_f
		end 
		@errors.delete :price
		ready_generate
	end # at
	def to company 
		company = Company.find_or_create_by_name(company) unless company.is_a? Company
		initialize_subject company
		# throw @errors unless @errors.empty?
		ready_generate
	end # company
	def from plant 
		plant = Plant.find_by_name(plant) unless plant.is_a? Plant
		initialize_subject plant
		# throw @errors unless @errors.empty?
		ready_generate
	end # from
	def some *stuff
		thing = stuff.map { |hash| {:quantity => hash[:quantity].to_f, :units => hash[:units].to_s} }

		initialize_volumes *thing
		self.of *(stuff.map { |hash| hash[:name] })
		self.at *(stuff.map { |hash| hash[:price] })
		ready_generate
	end # some
	def signed_by user
		@user = user
		ready_generate
	end # user

	private
	def initialize_errors
		@errors = {
			:price => "No price specified" ,
			:plant => "No plant specified" ,
			:material => "No material specified" ,
			:company => "No company specified"
		}
	end # initialize_errors
	def initialize_readies
		@ready_checks ||= []
		@ready_checks << lambda do |trans|
			# throw "You have the following errors: " + trans.errors.inject( "" ){ |m, b| m + ": " + b.last + "\n" }  unless trans.errors.empty?
			trans.errors.empty?
		end # implement_check

		@ready_checks << lambda do |trans|
			[:materials, :quantities, :prices, :prices].inject(true) do |mem, kk|
				mem &&= trans.send(kk).count == trans.materials.count
			end
		end # check trans
	end # readies
	def initialize_subject subject, genre=nil
		if subject.is_a? Plant
			@plant = subject 
			@errors.delete :plant
		end
		if subject.is_a? Company 
			@company = subject 
			@errors.delete :company
		end
		@genre = genre unless genre.nil?
	end # intialize_subjects
	def initialize_volumes *qs
		@quantities ||= []
		@units ||= []
		qs.each do |hash|
			if hash.is_a? String
				@units << hash
			elsif hash.is_a? Float or hash.is_a? Fixnum or hash.is_a? Integer 
				@quantities << hash
			elsif hash.is_a? Hash 
				@units << hash[:units] if hash.has_key? :units
				@quantities << hash[:quantity] if hash.has_key? :quantity
			else
				@errors[:volumes] = "You've given the transaction some bad quantity or units data #{hash}"
			end
		end # each hash
	end # initialize_volumes
	def ready_generate
		return create_order if all_ready?
		self
	end # ready_generate
	def all_ready?
		flag = @ready_checks.inject(true) do |mem, check|
			mem &&= check.call self
		end # check
	end # all_ready?
	def create_order
		order = @company.orders.new
		order.plant_id = @plant.id 
		if order.save
			get_name = lambda do |m|
				if m.is_a? Material
					m.name
				elsif m.is_a? String 
					m 
				else
					throw "Bad material input error"
				end # if
			end # get_name
			@materials.zip_with( @quantities, @units, @prices ) do |q,u,p,m|
				{ :quantity => q, :units => u, :unit_price => (genre == "sale" ? p : -p), :name => get_name.call(m) }
			end.each do |package|
				throw "Problem attaching material #{package}" unless order.materials.create package
			end # zip_with.each
		else
			throw "Something went terribly wrong saving the order"
		end # if
		return order
	end # create_order
end # Transaction

# class Transaction
# 	include TemporaryRecord
# 	attr_accessor :plant, :company, :volumes, :storage, :errors, :genre
# 	attr_reader :ready_checks

# 	def key
# 		plant.id + genre
# 	end # key

# 	def serialize
# 		hash = {}
# 		pull_name = lambda do |thing| 
# 			if thing.responds_to? :name 
# 				thing.name 
# 			elsif thing.respond_to? :[] and thing[:name]
# 				thing[:name]
# 			elsif thing.is_a? String
# 				thing
# 			else
# 				throw "Serialization has gone wrong #{thing}"
# 			end
# 		end
# 		hash[:plant] = pull_name.call(@plant) unless @plant.nil? 
# 		hash[:company] = pull_name.call(@company) unless @company.nil?
# 		hash[:materials] = @materials.inject("") { |m,c| m + "==--==" + pull_name(c) } unless @materials.nil?
# 		hash[:quantities] = @volumes.inject("") { |m,c| m + "==--==" + c[:quantity] } unless @volumes.nil?
# 		hash[:units] = @volumes.inject("") { |m,c| m + "==--==" + c[:units] } unless @volumes.nil?
# 		hash[:prices] = @prices.inject("") { |m,c| m + "==--==" + c[:price] } unless @prices.nil?
# 		return hash
# 	end # serialize

# 	def deserialize hash

# 	end # dserialize

# 	def implement_check &block
# 		@ready_checks ||= []
# 		@ready_checks << block
# 	end # implement_check

# 	# qs = [{ 100 => 'lbs'}, {200 => 'tons'}]
# 	def initialize subject, genre, *qs
# 		initialize_errors
# 		initialize_readies
# 		initialize_subject subject, genre
# 		initialize_volumes *qs unless qs.empty?
# 	end # initialize

# 	# stuff = [{:name => , :quantity => , :units => , :price => }]
# 	def some *stuff
# 		initialize_volumes *(stuff.map { |hash| {:quantity => hash[:quantity], :units => hash[:units]} })
# 		self.of *(stuff.map { |hash| hash[:name] })
# 		self.at *(stuff.map { |hash| hash[:price] })
# 	end # some

# 	def of *materials
# 		Rails.logger.debug "of material"
# 		materials.each do |material|
# 			(@materials ||= []) << material
# 		end
# 		return self
# 	end # of

# 	def at *prices
# 		Rails.logger.debug "at price"
# 		prices.each do |price|
# 			(@prices ||= []) << price
# 		end # prices
# 		return self
# 	end # price

# 	def from p 
# 		@plant = p
# 		@errors.delete :plant 
# 		mismatch_check
# 		initialize_storage
# 		return create_order if ready? 
# 		nil
# 	end # from

# 	def to c
# 		@company = c
# 		@errors.delete :company
# 		mismatch_check
# 		initialize_storage
# 		return create_order if ready?
# 		nil
# 	end # to

# 	def ready?
# 		okay_flag = true
# 		ready_checks.each do |check|
# 			if check.call(self) != true
# 				okay_flag = false 
# 				break
# 			end
# 		end unless @ready_checks.nil? # read_checks
# 		okay_flag
# 	end # ready?
	
# 	private
# 	def mismatch_check
# 		if @materials.count != volumes.count
# 			@errors[:mismatch] = "Mismatch count error"
# 		end # if
# 		if @prices.count > volumes.count
# 			@errors[:mismatch] = "Mismatch price error"
# 		end # if
# 	end # mismatch_check

# 	def initialize_storage
# 		Rails.logger.debug "initialize_storage"
# 		unless @company.is_a? Company
# 			@company = Company.find_by_name(@company)
# 			@errors[:company] = "no such company" if @company.nil?
# 		end # company
# 		@materials = @materials.map do |material| 
# 			if material.is_a? Material
# 				material 
# 			elsif material.is_a? String
# 				@plant.materials.find_by_name(material)
# 			else
# 				nil
# 			end
# 		end # materials
# 		@storage = {}
# 		@materials.count.times do |k|
# 			Rails.logger.debug "Materials List: "
# 			Rails.logger.debug @materials.to_s
# 			Rails.logger.debug "Prices List: "
# 			Rails.logger.debug @prices.to_s
# 			case genre
# 			when "sale"
# 				@storage[@materials[k].name] = volumes[k].merge :material => @materials[k], :unit_price => @prices[k]
# 			when "purchase"
# 				@storage[@materials[k].name] = volumes[k].merge :material => @materials[k], :unit_price => -@prices[k]
# 			else
# 				@errors[:genre] = "bad genre error #{genre}"
# 			end # genre
# 			@errors.delete :material if @errors.has_key? :material 
# 			@errors.delete :price if @errors.has_key? :price 
# 		end 
# 	end # initialize_storage

# 	def initialize_readies
# 		implement_check do |trans|
# 			if trans.errors.empty?
# 				true
# 			else
# 				throw "You have the following errors: " + trans.errors.inject( "" ){ |m, b| m + ": " + b.last + "\n" } 
# 				false
# 			end
# 		end # implement_check

# 		implement_check do |trans|
# 			okay_flag = true
# 			trans.storage.map { |key,hash| hash[:material] }.each do |material|
# 				if material.nil? or material.buyable_type != "Plant" or material.buyable_id != trans.plant.id
# 					Rails.logger.debug "Plant doesn't have the material requested: type-#{material.buyable_type}, id-#{material.buyable_id}"
# 					okay_flag = false 
# 					break
# 				end
# 			end # each material
# 			okay_flag
# 		end # check trans
# 	end # initialzie_readies

# 	def initialize_subject subject, g
# 		case subject.class.to_s
# 		when Plant.to_s
# 			@plant = subject
# 			@genre = g
# 			@errors.delete :plant
# 		when Company.to_s
# 			@company = subject
# 			@genre = g
# 			@errors.delete :company
# 		else
# 			raise "Unrecognized transaction initiator error: #{subject.class.to_s}"
# 		end # case
# 	end # subject

# 	def initialize_volumes *qs
# 		@volumes ||= []
# 		qs.each do |q|
# 			unless q.has_key? :quantity and q.has_key? :units
# 				throw "bad input exception. Correct format is qs = [{ :quantity => integer, :units => string },...]" 
# 			end # unless
# 			@volumes << q
# 		end # each qs
# 	end # volumes

# 	def initialize_errors
# 		@errors = {
# 			:price => "No price specified" ,
# 			:plant => "No plant specified" ,
# 			:material => "No material specified" ,
# 			:company => "No company specified"
# 		}
# 	end # initialize_errors

# 	def create_order
# 		order = company.orders.new
# 		order.plant_id = plant.id
# 		if order.save
# 			storage.each do |name, status|
# 				order.materials.create! status.reject { |k| k == :material }.merge(:name => name)
# 			end # each m
# 		else
# 			throw "Unable to process ordered materials error"
# 		end # if save
# 		return order
# 	end # create_order
# end # Transaction