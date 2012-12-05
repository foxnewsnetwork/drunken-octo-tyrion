module ControllerMacros
	def level_lookup rank
		case rank
		when :worker
			1
		when :logistics
			2
		when :sales
			3
		when :accounting
			4
		when :management
			5
		when :chief
			6
		when :admin
			7
		else
			0
		end # rank
	end # level_lookup

	def standard_setup stop=:order
		before :each do 
			@plant = FactoryGirl.create :plant
			next if stop == :plant
			@company = FactoryGirl.create :company
			next if stop == :company
			@material = @plant.materials.create FactoryGirl.attributes_for(:material)
			next if stop == :material
			@quantity = 100
			next if stop == :quantity
			@units = "pounds"
			next if stop == :units
			@price = 100
			next if stop == :price
			@order = @plant.sells(@quantity, @units).of(@material).at(@price).to(@company)
		end # each
	end # standard_setup

  def login_user(level)
	  case level.class.to_s
	  when Symbol.to_s
	  	rank = level_lookup level
	  when Integer.to_s, Fixnum.to_s
	  	rank = level
	  else
	  	throw "Bad input error #{level.class}"
	  end # level
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:user]
	   	@current_user = FactoryGirl.create :user, :level => rank
      # user.confirm! # or set a confirmed_at inside the factory. Only necessary if you are using the confirmable module
      sign_in @current_user
    end # before
  end # login_user
end # module