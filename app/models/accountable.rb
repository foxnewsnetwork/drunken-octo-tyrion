
module Accountable
	module ClassMethods
		

		attr_reader :accountable_expenses, :accountable_incomes
		def implement_income &block
			(@accountable_incomes ||= []) << block
		end # implement_income

		def implement_expenses &block
			(@accountable_expenses ||= []) << block
		end # implement
	end # ClassMethods

	def self.included(base)
		base.extend(ClassMethods)
		base.send(:define_method, "get_base") do 
			base
		end # base
	end # included

	def gross_income
		p1 = get_base.accountable_incomes.inject(0) do |mem, source|
			money = source.call self
			mem += money if !money.nil? and 0 > money
			mem
		end 
		get_base.accountable_expenses.inject(p1) do |mem, source|
			money = source.call self
			mem -= money if !money.nil? and 0 < money
			mem
		end # inject chain
	end # gross_income

	def expenses
		p1 = get_base.accountable_incomes.inject(0) do |mem, source|
			money = source.call self
			mem -= money if !money.nil? and 0 < money
			mem
		end 
		get_base.accountable_expenses.inject(p1) do |mem, source|
			money = source.call self
			mem += money if !money.nil? and 0 > money
			mem
		end
	end # expenses

	def net_income
		gross_income - expenses
	end # net_income
end # Accountable