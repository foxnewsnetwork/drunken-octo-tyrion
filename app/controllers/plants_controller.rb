class PlantsController < ApplicationController
	###
	# tsundere
	###
	{:worker => 1 , :logistics => 2 , :sales => 3 , :accounting => 4}.each do |friendzoned, ind|
		attr_tsundere :fail => "#access_denied", :as => ind
	end # friendzoned
	attr_tsundere :plant_sales_path, :plant_purchases_path, :plant_materials_path, :as => 3
	attr_tsundere :plant_outgoing_invoices_path, :plant_incoming_invoices_path, :as => 4
	attr_tsundere :new_plant_path, :as => 5
	attr_tsundere :edit_plant_path, :as => 6


	###
	# decent exposure
	###
	expose(:plants)
	expose(:plant)# ,  :finder => :find, :finder_parameter => :id )
	before_filter :allow_management, :only => [:create, :update, :destroy]
	before_filter :allow_worker, :only => [:index, :show, :new, :edit]


	def create
		if plant.save
			flash[:success] = t(:success, :scope => [:plant, :controllers, :create, :flash])
			redirect_to plant
		else
			flash.now[:error] = t(:error, :scope => [:plant, :controllers, :create, :flash])
			render :new
		end
	end # create

	def update

		if plant.update_attributes( params[:plant] )
			flash[:success] = t(:success, :scope => [:plant, :controllers, :update, :flash])
			redirect_to plant
		else
			flash.now[:error] = t(:error, :scope => [:plant, :controllers, :update, :flash])
			render :edit
		end
	end # update

	def destroy
		if plant.destroy
			flash[:success] = t(:success, :scope => [:plant, :controllers, :destroys, :flash])
			redirect_to plants_path
		else
			flash.now[:error] = t(:error, :scope => [:plant, :controllers, :destroys, :flash])
			render :index
		end
	end # destroy

	
end
