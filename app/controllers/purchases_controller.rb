class PurchasesController < ApplicationController
	expose( :plant )
	expose :orders, :ancestor => :plant do 
		plant.orders.where(:genre => "purchase")
	end # orders
	expose( :purchase ){ Purchase.new(plant, params[:purchase]) }
end
