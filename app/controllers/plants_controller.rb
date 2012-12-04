class PlantsController < ApplicationController
	#expose(:plants) { Plant.where(params.except(:action, :controller, :format)) }
	expose(:plant)# ,  :finder => :find, :finder_parameter => :id )
	before_filter :allow_management, :only => [:create, :update, :destroy]


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
