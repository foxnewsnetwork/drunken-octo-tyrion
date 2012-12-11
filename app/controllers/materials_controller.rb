class MaterialsController < ApplicationController
	respond_to :html, :js, :json
	# expose(:order) # { Order.find(params[:order_id]) }
	expose(:plant)
	expose(:starting) do 
		s = Date.civil(params[:start][:year].to_i, params[:start][:month].to_i, params[:start][:day].to_i) if params.has_key? :start 
		s ||= 100.years.ago
	end
	expose(:ending) do 
		e = Date.civil(params[:end][:year].to_i, params[:end][:month].to_i, params[:end][:day].to_i) if params.has_key? :end 
		e ||= DateTime.now
	end
	expose(:sales) do
		plant.orders.sales.from(starting).to(ending).inject({}) do |mem, sale|
			sale.materials.inject(mem) do |mem, material|
				if mem.has_key? material.name
					mem[material.name] += Mass.new material.quantity, material.units
				else
					mem[material.name] = Mass.new material.quantity, material.units
				end # if
				mem
			end # reduce
			mem
		end # reduce
	end # ecpose
	expose(:purchases) do
		plant.orders.purchases.from(starting).to(ending).inject({}) do |mem, purchase|
			purchase.materials.inject(mem) do |mem, material|
				if mem.has_key? material.name
					mem[material.name] += Mass.new material.quantity, material.units
				else
					mem[material.name] = Mass.new material.quantity, material.units
				end # if
				mem
			end # reduce
			mem
		end # reduce
	end # ecpose
	expose(:material) do 
		Material.find_by_id params[:id]
	end # material

	before_filter :allow_sales
	def destroy
		if material.destroy
			flash[:success] = t :success, :scope => [:material, :controller, :destroy]
		else
			throw "delete failed #{material}"
			flash[:error] = t :error, :scope => [:material, :controller, :destroy]
		end
		redirect_to :back
	end # destroy

end # Materials
