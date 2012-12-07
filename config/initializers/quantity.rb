# Quantities are numbers with dimensions


module Dimensional
	module ClassMethods
		attr_accessor :conversions

		def implement_base string
			@conversions = {
				string => 1
			} # conversions
		end # implement_base

		def implement_dimension string, amount
			throw "Base value not implemented yet Error" if @conversions.nil?
			conversions[string] = amount
		end # implement_dimension
	end # ClassMethods
	def self.included(base)
		base.extend ClassMethods
	end # included

	def dimension
		throw "Not defined error!"
	end
	def dimension= d
		throw "Not defined error!"
	end
	def value
		throw "Not defined error!"
	end
	def value=
		throw "Not defined error!"
	end

	def +(y)
		throw_a_hissy_fit y
		c = self.class.conversions[y.dimension] / self.class.conversions[dimension]
		output = clone
		output.value = value + (y.value * c)
		output.dimension = dimension
		return output
	end # y

	def -(y)
		throw_a_hissy_fit y
		c = self.class.conversions[y.dimension] / self.class.conversions[dimension]
		output = clone
		output.value = value - (y.value * c)
		output.dimension = dimension
		return output
	end # sub

	private
	def throw_a_hissy_fit y
		throw "You cannot add constants to things with dimensions" unless y.class.respond_to? :conversions
		[self, y].each do |subject|
			throw "#{subject} has no dimensions" unless subject.respond_to? :dimension
			throw "#{subject} is the wrong dimension" unless subject.class.conversions.has_key? subject.dimension
		end # each subject
	end # hissy-fit
end # dimensional

class Mass
	include Dimensional

	implement_base 'pounds'
	implement_dimension 'tons', 2000
	implement_dimension 'metric tons', 2204.62262
	implement_dimension 'grams', 0.00220462
	implement_dimension 'kilograms', 2.20462

	attr_accessor :dimension, :value
	def initialize weight, units
		@dimension = units
		@value = weight
	end # initialize

	def to_s
		"#{value} #{dimension}"
	end # to_s

	def to_a
		[value, dimension]
	end # to_a
end # mass