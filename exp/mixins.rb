module Accountable
	def self.included(base)
		puts "Call back hit"
		class << self
			def static_fun
				puts "this is static"
			end # static_fun
		end # monkey patch
	end # callback

	def dynamic_fun
		puts "This is dynamic"
	end # dynamci
end # Accountable

class Order
	include Accountable
end # Order

