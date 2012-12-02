class RemovePlantIdAndOrderIdFromMaterials < ActiveRecord::Migration
  def up
  	remove_index :materials, [:name, :order_id]
  	remove_index :materials, [:plant_id, :name]
  	remove_column :materials, :plant_id
  	remove_column :materials, :order_id
  end

  def down
  	remove_column :materials, :plant_id
  	remove_column :materials, :order_id
  	remove_index :materials, [:name, :order_id], :unique => true
  	remove_index :materials, [:plant_id, :name], :unique => true
  end
end
