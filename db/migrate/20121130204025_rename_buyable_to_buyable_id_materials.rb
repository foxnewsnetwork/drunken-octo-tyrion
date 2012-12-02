class RenameBuyableToBuyableIdMaterials < ActiveRecord::Migration
  def up
  	rename_column :materials, :buyable, :buyable_id
  end

  def down
  	rename_column :materials, :buyable_id, :buyable
  end
end
