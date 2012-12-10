module PlantsHelper
	def tabify plant, *symbols
		symbols.inject([]) do |mem, s|
			thing = {}
			case s
			when :edit
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = edit_plant_path plant 
				thing[:content] = t(:edit_content, :scope => [:plant, :view, :show])
			when :sale
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = plant_sales_path plant
				thing[:content] = t(:sale_content, :scope => [:plant, :view, :show]) + " ~ $#{plant.net_income}"
			when :purchase
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = plant_purchases_path plant
				thing[:content] = t(:purchase_content, :scope => [:plant, :view, :show]) + " ~ $#{plant.expenses}"
			when :inventory
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = plant_materials_path plant
				thing[:content] = t(:inventory_content, :scope => [:plant, :view, :show])
			when :outgoing
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = plant_outgoing_invoices_path plant
				thing[:content] = t(:outgoing_content, :scope => [:plant, :view, :show]) + " ~ $#{plant.actual_income}"
			when :incoming
				thing[:icon] = "http://placehold.it/270x333"
				thing[:href] = plant_incoming_invoices_path plant
				thing[:content] = t(:incoming_content, :scope => [:plant, :view, :show]) + " ~ $#{plant.actual_expenses}"
			else
				throw "#{s} cannot be tabified"
			end # case
			thing[:header] = t(s, :scope => [:plant, :view, :show])
			mem.push thing
			mem
		end # inject
	end # tabify
end # PlantsHelper
