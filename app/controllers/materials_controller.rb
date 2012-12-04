class MaterialsController < ApplicationController
	respond_to :html, :js, :json
	expose(:plant)
	expose(:materials, :ancestor => :plant)
	expose(:material)

	def create
		if material.save
			flash[:success] = t(:success, :scope => [:material, :controller, :create])
		else
			flash[:error] = t(:error, :scope => [:material, :controller, :create])
		end
		respond_with material
	end # create
end # Materials
